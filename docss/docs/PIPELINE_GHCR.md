# Using GitHub Container Registry (GHCR) with Bitbucket Pipelines

This document explains how to configure Bitbucket Pipelines to push images to GHCR (ghcr.io) and how to make GHCR images available to your Kubernetes cluster.

Important: Do NOT commit tokens or passwords into the repository. Use Bitbucket repository or workspace variables to store secrets.

1) Add repository variables in Bitbucket

- Log in to Bitbucket, go to your repository > Settings > Repository variables.
- Add the following **secured** variables:
  - `GHCR_USERNAME` = your GitHub username (e.g. `atonixdev`)
  - `GHCR_TOKEN` = your GitHub Personal Access Token (scopes: `write:packages`, `read:packages`, `repo` if you need to access private repos)

Optionally, if you use Docker Hub or another registry, set `DOCKER_REGISTRY`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`.

2) Pipeline changes

The pipeline has been updated to prefer `GHCR_TOKEN` when present. The build steps will:

- Use `ghcr.io/atonixdev/atonixcorp/<component>` as the image name by default.
- Login to GHCR using `GHCR_USERNAME` and `GHCR_TOKEN` if provided.

3) Creating a Kubernetes imagePullSecret

If your GHCR image is private, create a Kubernetes secret and reference it in your Deployment. Example:

```bash
kubectl create secret docker-registry ghcr-regcred \
  --docker-server=ghcr.io \
  --docker-username=${GHCR_USERNAME} \
  --docker-password=${GHCR_TOKEN} \
  --namespace=atonixcorp
```

Then add to your `k8s/platform-deployment.yaml` spec:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: ghcr-regcred
```

4) Notes on GHCR tokens and scopes

- For pushing images from pipelines, create a personal access token with `write:packages` and `read:packages` scopes. If pushing from a GitHub Actions workflow within the same org/repo, additional repo scopes may be needed.
- Keep the token secured in Bitbucket variables and rotate it regularly.

5) If you want me to add the `imagePullSecrets` block to the k8s deployment manifest, tell me and I will patch `k8s/platform-deployment.yaml` for you.
