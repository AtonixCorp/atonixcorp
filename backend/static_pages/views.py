from django.shortcuts import render


def about(request):
    return render(request, 'static_pages/about.html')


def privacy(request):
    return render(request, 'static_pages/privacy.html')
