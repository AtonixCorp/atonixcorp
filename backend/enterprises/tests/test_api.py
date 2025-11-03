from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from ..models import Enterprise, EnterpriseGroup, MigrationRun


class EnterprisesAPITest(APITestCase):
    def setUp(self):
        # create a staff user
        self.staff = User.objects.create_user(username='admin', email='admin@example.com', password='pass1234')
        self.staff.is_staff = True
        self.staff.save()
        self.staff_token = Token.objects.create(user=self.staff)

        # regular user
        self.user = User.objects.create_user(username='user', email='user@example.com', password='pass1234')
        self.user_token = Token.objects.create(user=self.user)

        self.client = APIClient()
        # set a valid user-agent to satisfy RequestValidationMiddleware
        self.client.defaults['HTTP_USER_AGENT'] = 'UnitTest/1.0'

    def test_create_enterprise_requires_staff(self):
        url = reverse('enterprise-list')  # /api/enterprises/

        # attempt as regular user
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        resp = self.client.post(url, {'name': 'TestCo', 'slug': 'testco'}, format='json')
        self.assertIn(resp.status_code, (403, 401))

        # attempt as staff
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        resp = self.client.post(url, {'name': 'TestCo', 'slug': 'testco'}, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Enterprise.objects.filter(slug='testco').exists())

    def test_create_group_and_list(self):
        # create enterprise as staff
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        ent_resp = self.client.post(reverse('enterprise-list'), {'name': 'GCo', 'slug': 'gco'}, format='json')
        ent_id = ent_resp.data.get('id')

        # create a group as authenticated user
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        grp_url = f'/api/enterprises/{ent_id}/groups/'
        create_resp = self.client.post(grp_url, {'name': 'Platform', 'description': 'Platform group'}, format='json')
        self.assertEqual(create_resp.status_code, 201)
        # list
        list_resp = self.client.get(grp_url)
        self.assertEqual(list_resp.status_code, 200)
        data = list_resp.data.get('data') or list_resp.data
        self.assertTrue(any(g['name'] == 'Platform' for g in data))

    def test_migration_runs_list(self):
        # create enterprise
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.staff_token.key}')
        ent_resp = self.client.post(reverse('enterprise-list'), {'name': 'MCo', 'slug': 'mco'}, format='json')
        ent_id = ent_resp.data.get('id')
        # create a run directly
        Enterprise_obj = Enterprise.objects.get(id=ent_id)
        MigrationRun.objects.create(enterprise=Enterprise_obj, run_id='run-1', status='completed')
        runs_url = f'/api/enterprises/{ent_id}/migration/runs/'
        self.client.credentials()  # anonymous allowed
        resp = self.client.get(runs_url)
        self.assertEqual(resp.status_code, 200)
        data = resp.data.get('data') or resp.data
        self.assertTrue(len(data) >= 1)
