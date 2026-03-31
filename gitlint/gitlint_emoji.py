"""
Gitlint extra rule to validate that the message title is of the form
"<gitmoji>(<scope>) <subject>"
"""
from __future__ import unicode_literals

import re

import requests

from gitlint.rules import CommitMessageTitle, LineRule, RuleViolation


class GitmojiTitle(LineRule):
    """
    This rule will enforce that each commit title is of the form "<gitmoji>(<scope>) <subject>"
    where gitmoji is an emoji from the list defined in https://gitmoji.carloscuesta.me and
    subject should be all lowercase
    """

    id = "UC1"
    name = "title-should-have-gitmoji-and-scope"
    target = CommitMessageTitle

    def validate(self, title, _commit):
        try:
            gitmojis = requests.get(
                "https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json",
                timeout=10
            ).json()["gitmojis"]
            # Normalize: strip variation selectors (U+FE0F, U+FE0E) from both sides
            emojis = [item["emoji"].replace("\ufe0f", "").replace("\ufe0e", "") for item in gitmojis]
        except Exception:
            return []
    
        # Also normalize the title before matching
        normalized_title = title.replace("\ufe0f", "").replace("\ufe0e", "")
        pattern = r"^({:s})\(\S+\)\s[a-z].*$".format("|".join(emojis))
        
        if not re.search(pattern, normalized_title):
            violation_msg = 'Title does not match regex "<gitmoji>(<scope>) <subject>": "{}"'.format(title)
            return [RuleViolation(self.id, violation_msg, title)]