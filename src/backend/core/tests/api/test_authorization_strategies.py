"""Tests for reusable authorization strategies."""

from unittest import mock

from core.api.authorization_strategies import (
    ResourceOwnerDeleteStrategy,
    ResourceRoomPrivilegeStrategy,
    RoomOwnerStrategy,
    RoomPrivilegeStrategy,
)
from core.models import RoleChoices


def test_room_privilege_strategy_delegates_to_room_privilege_check():
    """Room privilege strategy should use room administrator-or-owner rules."""
    user = mock.Mock()
    room = mock.Mock()
    room.is_administrator_or_owner.return_value = True

    strategy = RoomPrivilegeStrategy()

    assert strategy.has_access(user=user, room=room) is True
    room.is_administrator_or_owner.assert_called_once_with(user)


def test_room_owner_strategy_delegates_to_room_owner_check():
    """Room owner strategy should use room ownership rules."""
    user = mock.Mock()
    room = mock.Mock()
    room.is_owner.return_value = True

    strategy = RoomOwnerStrategy()

    assert strategy.has_access(user=user, room=room) is True
    room.is_owner.assert_called_once_with(user)


def test_resource_room_privilege_strategy_delegates_to_linked_room():
    """Resource strategy should check privileges on the linked room."""
    user = mock.Mock()
    resource_access = mock.Mock()
    resource_access.resource.is_administrator_or_owner.return_value = True

    strategy = ResourceRoomPrivilegeStrategy()

    assert strategy.has_access(user=user, resource_access=resource_access) is True
    resource_access.resource.is_administrator_or_owner.assert_called_once_with(user)


def test_resource_owner_delete_strategy_applies_to_owner_delete():
    """Owner-delete strategy should only apply to owner DELETE requests."""
    resource_access = mock.Mock(role=RoleChoices.OWNER)
    strategy = ResourceOwnerDeleteStrategy()

    assert (
        strategy.applies_to(
            method="DELETE",
            resource_access=resource_access,
        )
        is True
    )


def test_resource_owner_delete_strategy_does_not_apply_to_non_delete():
    """Owner-delete strategy should not apply to non-DELETE requests."""
    resource_access = mock.Mock(role=RoleChoices.OWNER)
    strategy = ResourceOwnerDeleteStrategy()

    assert (
        strategy.applies_to(
            method="PATCH",
            resource_access=resource_access,
        )
        is False
    )


def test_resource_owner_delete_strategy_checks_linked_user():
    """Owner-delete strategy should allow the linked user."""
    user = mock.Mock()
    resource_access = mock.Mock(user=user)
    strategy = ResourceOwnerDeleteStrategy()

    assert strategy.has_access(user=user, resource_access=resource_access) is True
