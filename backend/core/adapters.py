from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom social account adapter for AtonixCorp platform.

    Handles social authentication for individual users with enhanced
    user profile creation and validation.
    """

    def pre_social_login(self, request, sociallogin):
        """
        Called before social login is processed.
        Used to connect existing accounts or handle conflicts.
        """
        # Check if user already exists with this email
        email = sociallogin.account.extra_data.get('email')
        if email:
            try:
                user = User.objects.get(email=email)
                # If user exists but no social account, connect it
                if not SocialAccount.objects.filter(user=user, provider=sociallogin.account.provider).exists():
                    sociallogin.connect(request, user)
            except User.DoesNotExist:
                pass

    def populate_user(self, request, sociallogin, data):
        """
        Populate user instance with data from social provider.
        """
        user = super().populate_user(request, sociallogin, data)

        # Set user type to individual for social signups
        user.user_type = 'individual'

        # Extract additional profile data based on provider
        if sociallogin.account.provider == 'github':
            user.username = data.get('login', user.username)
            user.bio = data.get('bio', '')
            user.github_url = data.get('html_url', '')
            user.location = data.get('location', '')
        elif sociallogin.account.provider == 'gitlab':
            user.username = data.get('username', user.username)
            user.bio = data.get('bio', '')
            user.location = data.get('location', '')
        elif sociallogin.account.provider == 'linkedin_oauth2':
            # LinkedIn data structure is different
            user.first_name = data.get('firstName', {}).get('localized', {}).get('en_US', user.first_name)
            user.last_name = data.get('lastName', {}).get('localized', {}).get('en_US', user.last_name)
            user.linkedin_url = data.get('vanityName', '')
        elif sociallogin.account.provider == 'google':
            user.first_name = data.get('given_name', user.first_name)
            user.last_name = data.get('family_name', user.last_name)
            user.bio = data.get('bio', '')

        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Save the user instance and perform additional setup.
        """
        user = super().save_user(request, sociallogin, form)

        # Additional user setup for social accounts
        # Could add welcome email, default settings, etc.

        return user