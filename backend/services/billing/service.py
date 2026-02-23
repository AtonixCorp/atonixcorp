# AtonixCorp Cloud – Billing Service

import math
import random
import uuid
from datetime import date, timedelta, datetime
from decimal import Decimal
from django.utils import timezone


def _live() -> bool:
    """Return True when a real payment processor is configured."""
    import os
    return bool(os.environ.get('STRIPE_SECRET_KEY') or os.environ.get('BILLING_LIVE'))


# ── Mock helpers ───────────────────────────────────────────────────────────────

_SERVICES = ['compute', 'storage', 'database', 'networking', 'containers', 'email', 'dns']

_MOCK_USAGE_BASE = {
    'compute_hours': (280,  50),
    'storage_gb':    (420,  30),
    'bandwidth_gb':  (195,  40),
    'api_calls':     (85000, 8000),
    'email_sent':    (12000, 2000),
    'db_hours':      (110,  20),
    'snapshots':     (18,   4),
    'ip_addresses':  (3,    1),
    'load_balancers':(2,    0),
}

def _wave(base, amp, seed=0):
    """Deterministic sinusoidal variation."""
    return base + amp * math.sin(seed * 0.7 + base * 0.01)


def _mock_monthly_usage(year: int, month: int) -> list[dict]:
    """Generate a list of mock usage line items for a given month."""
    from .models import UNIT_PRICES
    seed = year * 12 + month
    items = []
    for metric, (base, amp) in _MOCK_USAGE_BASE.items():
        qty = max(0, _wave(base, amp, seed) + random.gauss(0, amp * 0.1))
        price = UNIT_PRICES.get(metric, 0)
        items.append({
            'metric':     metric,
            'service':    _service_for(metric),
            'quantity':   round(qty, 2),
            'unit':       _unit_for(metric),
            'unit_price': price,
            'cost':       round(qty * price, 4),
            'description': _label_for(metric),
        })
    return items


def _service_for(metric: str) -> str:
    m = {
        'compute_hours': 'compute', 'storage_gb': 'storage',
        'bandwidth_gb': 'networking', 'api_calls': 'api',
        'email_sent': 'email', 'db_hours': 'database',
        'snapshots': 'storage', 'ip_addresses': 'networking',
        'load_balancers': 'networking',
    }
    return m.get(metric, 'compute')


def _unit_for(metric: str) -> str:
    m = {
        'compute_hours': 'hrs', 'storage_gb': 'GB',
        'bandwidth_gb': 'GB', 'api_calls': 'calls',
        'email_sent': 'emails', 'db_hours': 'hrs',
        'snapshots': 'snaps', 'ip_addresses': 'IPs',
        'load_balancers': 'LBs',
    }
    return m.get(metric, 'units')


def _label_for(metric: str) -> str:
    return metric.replace('_', ' ').title()


# ── Billing Account ────────────────────────────────────────────────────────────

def get_or_create_account(owner):
    from .models import BillingAccount
    acct, _ = BillingAccount.objects.get_or_create(
        owner=owner,
        defaults={
            'plan': 'free',
            'billing_email': owner.email,
        }
    )
    return acct


def update_account(owner, data: dict):
    acct = get_or_create_account(owner)
    for field, val in data.items():
        if hasattr(acct, field):
            setattr(acct, field, val)
    acct.save()
    return acct


# ── Payment Methods ────────────────────────────────────────────────────────────

def add_payment_method(owner, data: dict):
    """Mock: store a payment method (in production this would call Stripe)."""
    from .models import PaymentMethod
    if data.get('is_default'):
        PaymentMethod.objects.filter(owner=owner).update(is_default=False)
    pm = PaymentMethod.objects.create(
        owner=owner,
        type=data.get('type', 'card'),
        is_default=data.get('is_default', False),
        card_brand=data.get('card_brand', ''),
        card_last4=data.get('card_last4', '0000'),
        card_exp_month=data.get('card_exp_month'),
        card_exp_year=data.get('card_exp_year'),
        display_name=data.get('display_name', ''),
        is_verified=True,
    )
    return pm


def set_default_payment_method(owner, pm_id: int):
    from .models import PaymentMethod
    PaymentMethod.objects.filter(owner=owner).update(is_default=False)
    PaymentMethod.objects.filter(owner=owner, id=pm_id).update(is_default=True)


def delete_payment_method(owner, pm_id: int):
    from .models import PaymentMethod
    PaymentMethod.objects.filter(owner=owner, id=pm_id).delete()


# ── Overview ──────────────────────────────────────────────────────────────────

def get_billing_overview(owner) -> dict:
    from .models import BillingAccount, Invoice, CreditNote
    acct = get_or_create_account(owner)

    today = date.today()
    # Current month usage cost (mock)
    usage_items = _mock_monthly_usage(today.year, today.month)
    current_spend = round(sum(i['cost'] for i in usage_items), 4)

    # Projected (assume linear interpolation through month)
    days_in_month = 30
    day_of_month  = today.day
    projected     = round(current_spend * (days_in_month / max(day_of_month, 1)), 4)

    # Real DB numbers
    open_balance = float(Invoice.objects.filter(owner=owner, status='open').aggregate(
        t=__import__('django.db.models', fromlist=['Sum']).Sum('total')
    )['t'] or 0)
    credit_balance = float(acct.credit_balance)

    # Last 3 months trend
    trend = []
    for i in range(3, 0, -1):
        m = (today.month - i - 1) % 12 + 1
        y = today.year - ((today.month - i - 1) // 12 + (1 if today.month - i - 1 < 0 else 0))
        items = _mock_monthly_usage(y, m)
        trend.append({
            'month':  f'{y}-{m:02d}',
            'amount': round(sum(it['cost'] for it in items), 4),
        })

    return {
        'account':       _account_dict(acct),
        'current_spend': current_spend,
        'projected':     projected,
        'open_balance':  open_balance,
        'credit_balance': credit_balance,
        'trend':         trend,
        'usage_breakdown': usage_items,
    }


def _account_dict(acct) -> dict:
    from .models import PLAN_PRICES, PLAN_FEATURES
    return {
        'id':           acct.id,
        'plan':         acct.plan,
        'plan_price':   PLAN_PRICES.get(acct.plan, 0),
        'plan_features': PLAN_FEATURES.get(acct.plan, {}),
        'company_name': acct.company_name,
        'billing_email': acct.billing_email,
        'currency':     acct.currency,
        'auto_pay':     acct.auto_pay,
        'credit_balance': float(acct.credit_balance),
        'spend_limit':  float(acct.spend_limit) if acct.spend_limit else None,
    }


# ── Usage ──────────────────────────────────────────────────────────────────────

def get_current_usage(owner) -> dict:
    today = date.today()
    items = _mock_monthly_usage(today.year, today.month)
    by_service: dict = {}
    for it in items:
        svc = it['service']
        by_service.setdefault(svc, 0)
        by_service[svc] = round(by_service[svc] + it['cost'], 4)
    return {
        'period':    f'{today.year}-{today.month:02d}',
        'line_items': items,
        'by_service': [{'service': s, 'cost': c} for s, c in sorted(by_service.items(), key=lambda x: -x[1])],
        'total':     round(sum(i['cost'] for i in items), 4),
    }


# ── Invoices ───────────────────────────────────────────────────────────────────

def _generate_invoice_number():
    return f'INV-{uuid.uuid4().hex[:10].upper()}'


def get_or_generate_invoice(owner, year: int, month: int):
    """
    Return (or lazily create) the invoice for the given month.
    In production this would correspond to a real charge cycle.
    """
    from .models import Invoice, InvoiceLineItem
    from datetime import date as dt
    import calendar

    period_start = dt(year, month, 1)
    last_day     = calendar.monthrange(year, month)[1]
    period_end   = dt(year, month, last_day)

    existing = Invoice.objects.filter(owner=owner, period_start=period_start).first()
    if existing:
        return existing

    # Build from mock usage
    items     = _mock_monthly_usage(year, month)
    subtotal  = round(sum(i['cost'] for i in items), 4)
    tax_rate  = Decimal('0.08')
    tax_amt   = round(subtotal * float(tax_rate), 4)
    total     = round(subtotal + tax_amt, 4)

    inv = Invoice.objects.create(
        owner=owner,
        period_start=period_start,
        period_end=period_end,
        subtotal=Decimal(str(subtotal)),
        tax_rate=tax_rate,
        tax_amount=Decimal(str(tax_amt)),
        total=Decimal(str(total)),
        status='paid' if month < date.today().month or year < date.today().year else 'open',
        due_date=period_end + timedelta(days=14),
        currency='USD',
    )
    for it in items:
        InvoiceLineItem.objects.create(
            invoice=inv,
            service=it['service'],
            description=it['description'],
            quantity=Decimal(str(it['quantity'])),
            unit=it['unit'],
            unit_price=Decimal(str(it['unit_price'])),
            amount=Decimal(str(it['cost'])),
        )
    return inv


def ensure_recent_invoices(owner, months: int = 6):
    """Pre-generate the last N months of invoices for a new account."""
    today = date.today()
    for i in range(1, months + 1):
        m = (today.month - i - 1) % 12 + 1
        y = today.year - ((today.month - i - 1) // 12 + (1 if today.month - i - 1 < 0 else 0))
        try:
            get_or_generate_invoice(owner, y, m)
        except Exception:
            pass


# ── Subscription / Plan ────────────────────────────────────────────────────────

def change_plan(owner, new_plan: str) -> dict:
    from .models import BillingAccount, PLAN_PRICES, PlanTier
    valid = [t.value for t in PlanTier]
    if new_plan not in valid:
        raise ValueError(f'Invalid plan: {new_plan}')
    acct = get_or_create_account(owner)
    old_plan = acct.plan
    acct.plan = new_plan
    acct.save()
    return {
        'old_plan':  old_plan,
        'new_plan':  new_plan,
        'new_price': PLAN_PRICES[new_plan],
        'message':   f'Plan changed from {old_plan} to {new_plan}',
    }


# ── Credits ────────────────────────────────────────────────────────────────────

def get_credits(owner) -> list:
    from .models import CreditNote
    return list(CreditNote.objects.filter(owner=owner).values(
        'id', 'amount', 'currency', 'reason', 'description',
        'expires_at', 'created_at',
    ))


def apply_credit(owner, invoice_id: int, amount: Decimal) -> dict:
    from .models import Invoice, BillingAccount
    inv = Invoice.objects.get(id=invoice_id, owner=owner)
    acct = get_or_create_account(owner)
    applied = min(amount, acct.credit_balance, inv.total)
    inv.credits_applied  += applied
    inv.total            -= applied
    inv.save()
    acct.credit_balance  -= applied
    acct.save()
    return {'applied': float(applied), 'remaining_credit': float(acct.credit_balance)}
