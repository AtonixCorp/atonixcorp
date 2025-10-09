"""
Distributed locking using Zookeeper.
"""
import time
import logging
from typing import Optional
from contextlib import contextmanager
from core.zookeeper_client import get_zk_client


logger = logging.getLogger(__name__)


class DistributedLock:
    """Distributed lock implementation using Zookeeper."""
    
    def __init__(self, lock_name: str, timeout: int = 30):
        self.lock_name = lock_name
        self.timeout = timeout
        self.lock_path = f"/locks/{lock_name}"
        self.zk_client = get_zk_client()
        self._acquired = False
    
    def acquire(self) -> bool:
        """Acquire the distributed lock."""
        try:
            self._acquired = self.zk_client.acquire_lock(self.lock_path, self.timeout)
            if self._acquired:
                logger.info(f"Acquired distributed lock: {self.lock_name}")
            else:
                logger.warning(f"Failed to acquire distributed lock: {self.lock_name}")
            return self._acquired
        except Exception as e:
            logger.error(f"Error acquiring lock {self.lock_name}: {e}")
            return False
    
    def release(self):
        """Release the distributed lock."""
        if self._acquired:
            try:
                self.zk_client.release_lock(self.lock_path)
                self._acquired = False
                logger.info(f"Released distributed lock: {self.lock_name}")
            except Exception as e:
                logger.error(f"Error releasing lock {self.lock_name}: {e}")
    
    def is_acquired(self) -> bool:
        """Check if the lock is currently acquired."""
        return self._acquired
    
    def __enter__(self):
        """Context manager entry."""
        if not self.acquire():
            raise RuntimeError(f"Failed to acquire lock: {self.lock_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.release()


@contextmanager
def distributed_lock(lock_name: str, timeout: int = 30):
    """Context manager for distributed locking."""
    lock = DistributedLock(lock_name, timeout)
    try:
        if not lock.acquire():
            raise RuntimeError(f"Failed to acquire lock: {lock_name}")
        yield lock
    finally:
        lock.release()


class TaskCoordinator:
    """Coordinate distributed tasks using locks."""
    
    def __init__(self, task_name: str):
        self.task_name = task_name
        self.zk_client = get_zk_client()
    
    def run_once(self, task_func, *args, **kwargs):
        """Ensure a task runs only once across all instances."""
        lock_name = f"task-{self.task_name}"
        
        with distributed_lock(lock_name, timeout=60):
            # Check if task has already been completed
            completion_path = f"/tasks/completed/{self.task_name}"
            if self.zk_client.get_config(completion_path):
                logger.info(f"Task {self.task_name} already completed")
                return None
            
            logger.info(f"Running task {self.task_name}")
            start_time = time.time()
            
            try:
                result = task_func(*args, **kwargs)
                
                # Mark task as completed
                completion_data = {
                    'completed_at': time.time(),
                    'duration': time.time() - start_time,
                    'success': True
                }
                self.zk_client.set_config(completion_path, completion_data)
                
                logger.info(f"Task {self.task_name} completed successfully")
                return result
                
            except Exception as e:
                # Mark task as failed
                completion_data = {
                    'completed_at': time.time(),
                    'duration': time.time() - start_time,
                    'success': False,
                    'error': str(e)
                }
                self.zk_client.set_config(completion_path, completion_data)
                
                logger.error(f"Task {self.task_name} failed: {e}")
                raise
    
    def is_completed(self) -> bool:
        """Check if the task has been completed."""
        completion_path = f"/tasks/completed/{self.task_name}"
        completion_data = self.zk_client.get_config(completion_path)
        return completion_data is not None and completion_data.get('success', False)
    
    def reset_task(self):
        """Reset task completion status."""
        completion_path = f"/tasks/completed/{self.task_name}"
        self.zk_client.delete_node(completion_path)
        logger.info(f"Reset task completion status for {self.task_name}")


# Lock utilities for common patterns
def with_lock(lock_name: str, timeout: int = 30):
    """Decorator for functions that need distributed locking."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            with distributed_lock(lock_name, timeout):
                return func(*args, **kwargs)
        return wrapper
    return decorator