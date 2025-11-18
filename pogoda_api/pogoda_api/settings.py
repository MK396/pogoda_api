"""
Django settings for pogoda_api project.
...
"""

from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ... (inne podstawowe ustawienia)

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = True
ALLOWED_HOSTS = []


# --- ZMIANA 1: INSTALLED_APPS (DODANIE DRF i CORS) ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Dodane dla API
    'rest_framework',
    # Dodane do obsługi zapytań z Reacta (z innego portu)
    'corsheaders',

    'pogoda_app',
]

# --- ZMIANA 2: MIDDLEWARE (DODANIE CORS) ---
MIDDLEWARE = [
    # MUSI BYĆ NA GÓRZE LISTY, PRZED CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'pogoda_api.urls'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Domyślny port Vite w trybie deweloperskim
    "http://127.0.0.1:5173",  # Alternatywny localhost
    # Dodaj tutaj adres URL frontendu w trybie produkcyjnym, np. "https://twoja-aplikacja-reacta.com"
]

# Jeśli konieczne, możesz zezwolić na wszystkie, ale to nie jest bezpieczne w produkcji:
# CORS_ALLOW_ALL_ORIGINS = True


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'pogoda_api.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases


"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv("DB_NAME"),
        'USER': os.getenv("DB_USER"),
        'PASSWORD': os.getenv("DB_PASSWORD"),
        'HOST': os.getenv("DB_HOST"),
        'PORT': '3306',
    }
}
"""


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Zmienione na SQLite
        'NAME': BASE_DIR / 'db.sqlite3',       # Domyślna ścieżka do pliku
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
