"""Reusable authorization strategies for API permissions."""

from core.models import RoleChoices


class RoomPrivilegeStrategy:
    """Authorize users with administrator-or-owner privileges on a room."""

    def has_access(self, *, user, room) -> bool:
        """Return whether the user has privileges on the room."""
        return room.is_administrator_or_owner(user)


class RoomOwnerStrategy:
    """Authorize room owners."""

    def has_access(self, *, user, room) -> bool:
        """Return whether the user owns the room."""
        return room.is_owner(user)


class ResourceRoomPrivilegeStrategy:
    """Authorize users with privileges on a resource's linked room."""

    def has_access(self, *, user, resource_access) -> bool:
        """Return whether the user has privileges on the linked room."""
        return resource_access.resource.is_administrator_or_owner(user)


class ResourceOwnerDeleteStrategy:
    """Authorize deletion of owner resource-access rows."""

    def applies_to(self, *, method, resource_access) -> bool:
        """Return whether this strategy applies to the request."""
        return method == "DELETE" and resource_access.role == RoleChoices.OWNER

    def has_access(self, *, user, resource_access) -> bool:
        """Only the linked user can delete an owner resource-access row."""
        return resource_access.user == user
