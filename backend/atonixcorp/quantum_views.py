from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
import json
from core.quantum_client import submit_quantum_job, get_job_status


@csrf_exempt
def submit_job(request):
    if request.method != 'POST':
        return HttpResponseBadRequest('Use POST')
    try:
        payload = json.loads(request.body)
        circuit = payload.get('circuit')
        shots = int(payload.get('shots', 1024))
        backend = payload.get('backend', 'simulator')

        result = submit_quantum_job(circuit, shots, backend)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def job_status(request, job_id: str):
    if request.method != 'GET':
        return HttpResponseBadRequest('Use GET')
    try:
        result = get_job_status(job_id)
        return JsonResponse(result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
