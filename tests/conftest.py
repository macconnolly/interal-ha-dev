"""Shared pytest configuration for local custom-component tests."""

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Allow tests to load integrations from the local custom_components tree."""
    yield
