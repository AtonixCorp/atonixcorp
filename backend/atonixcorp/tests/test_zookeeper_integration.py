import unittest
from unittest import mock

import importlib


class FakeCache(dict):
    def set(self, key, value, timeout=None):
        self[key] = value

    def get(self, key, default=None):
        return dict.get(self, key, default)


class ZookeeperIntegrationTests(unittest.TestCase):
    def setUp(self):
        # Import the module fresh
        self.module = importlib.import_module('zookeeper_integration')

        # Patch Django settings and cache into the module
        class DummySettings:
            ENVIRONMENT = 'test'

        self.patcher_settings = mock.patch.object(self.module, 'settings', DummySettings)
        self.patcher_cache = mock.patch.object(self.module, 'cache', FakeCache())

        self.patcher_settings.start()
        self.patcher_cache.start()

        # Patch KazooClient
        self.kazoo_patcher = mock.patch('zookeeper_integration.KazooClient')
        self.mock_kazoo_client_cls = self.kazoo_patcher.start()
        self.mock_client = mock.Mock()
        self.mock_kazoo_client_cls.return_value = self.mock_client

    def tearDown(self):
        self.kazoo_patcher.stop()
        self.patcher_settings.stop()
        self.patcher_cache.stop()

    def test_connect_and_namespace_creation(self):
        zk = self.module.ZookeeperManager()
        # Simulate client.start succeeding
        self.mock_client.start.return_value = None
        self.mock_client.ensure_path.return_value = None

        ok = zk.connect()
        self.assertTrue(ok)
        self.mock_kazoo_client_cls.assert_called()
        self.mock_client.start.assert_called()
        # namespace paths ensured
        self.mock_client.ensure_path.assert_any_call('/atonixcorp/test')
        self.mock_client.ensure_path.assert_any_call('/atonixcorp/test/config')

    def test_set_get_config(self):
        zk = self.module.ZookeeperManager()
        zk.client = self.mock_client
        zk._connected = True

        # Simulate exists False then create
        self.mock_client.exists.return_value = False
        self.mock_client.create.return_value = '/somepath'

        ok = zk.set_config('foo', {'bar': 1})
        self.assertTrue(ok)
        self.mock_client.create.assert_called()

        # Simulate get returning the JSON data
        data = b'{"bar": 1}'
        self.mock_client.get.return_value = (data, mock.Mock())

        value = zk.get_config('foo')
        self.assertEqual(value, {'bar': 1})

    def test_watch_config_registers_datwatch(self):
        zk = self.module.ZookeeperManager()
        zk.client = self.mock_client
        zk._connected = True

        called = {'flag': False}

        def cb(key, value):
            called['flag'] = True

        # Ensure DataWatch exists on client
        self.mock_client.DataWatch = mock.Mock()

        ok = zk.watch_config('foo', cb)
        self.assertTrue(ok)
        self.mock_client.DataWatch.assert_called()


if __name__ == '__main__':
    unittest.main()
