# AtonixCorp Cloud – Billing Viewsets

from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import BillingAccount, PaymentMethod, Invoice, CreditNote
from .serializers import (
    BillingAccountSerializer, UpdateBillingAccountSerializer,
    PaymentMethodSerializer, CreatePaymentMethodSerializer,
    InvoiceListSerializer, InvoiceDetailSerializer,
    CreditNoteSerializer,
)
from . import service as svc


class BillingOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = svc.get_billing_overview(request.user)
        return Response(data)


class BillingAccountViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        acct = svc.get_or_create_account(request.user)
        return Response(BillingAccountSerializer(acct).data)

    def partial_update(self, request, pk=None):
        ser = UpdateBillingAccountSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        acct = svc.update_account(request.user, ser.validated_data)
        return Response(BillingAccountSerializer(acct).data)

    @action(detail=False, methods=['post'], url_path='change-plan')
    def change_plan(self, request):
        new_plan = request.data.get('plan')
        if not new_plan:
            return Response({'detail': 'plan is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = svc.change_plan(request.user, new_plan)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)


class PaymentMethodViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        qs = PaymentMethod.objects.filter(owner=request.user)
        return Response(PaymentMethodSerializer(qs, many=True).data)

    def create(self, request):
        ser = CreatePaymentMethodSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        pm = svc.add_payment_method(request.user, ser.validated_data)
        return Response(PaymentMethodSerializer(pm).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        svc.delete_payment_method(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        svc.set_default_payment_method(request.user, pk)
        return Response({'detail': 'Default payment method updated'})


class InvoiceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        # Lazily generate last 6 months
        svc.ensure_recent_invoices(request.user, months=6)
        qs = Invoice.objects.filter(owner=request.user).order_by('-period_start')
        return Response(InvoiceListSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None):
        try:
            inv = Invoice.objects.get(id=pk, owner=request.user)
        except Invoice.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InvoiceDetailSerializer(inv).data)

    @action(detail=False, methods=['get'], url_path='month/(?P<year>[0-9]{4})/(?P<month>[0-9]{1,2})')
    def by_month(self, request, year=None, month=None):
        inv = svc.get_or_generate_invoice(request.user, int(year), int(month))
        return Response(InvoiceDetailSerializer(inv).data)

    @action(detail=True, methods=['post'], url_path='pay')
    def pay(self, request, pk=None):
        try:
            inv = Invoice.objects.get(id=pk, owner=request.user, status='open')
        except Invoice.DoesNotExist:
            return Response({'detail': 'Invoice not found or not open'}, status=status.HTTP_404_NOT_FOUND)
        from django.utils import timezone
        inv.status  = 'paid'
        inv.paid_at = timezone.now()
        inv.save()
        return Response(InvoiceDetailSerializer(inv).data)


class UsageViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = svc.get_current_usage(request.user)
        return Response(data)


class CreditViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = svc.get_credits(request.user)
        return Response(data)
