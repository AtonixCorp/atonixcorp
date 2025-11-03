Building and pushing images with nerdctl (containerd)

Overview
--------
This repository contains production Dockerfiles for backend, frontend and nginx.
If you want to build the images once (CI) and push them to a registry using nerdctl (containerd), use the provided script:

  scripts/nerdctl-build-push.sh

Requirements
------------
- containerd + nerdctl installed on your build agent (CI runner or dev host).
  - On most Linux distros: install containerd and nerdctl. On GitHub Actions use a containerd runner, or a self-hosted runner.
- Registry credentials available to `nerdctl` (either via `nerdctl login` or by configuring the build agent with credentials).
- Enough RAM/disk to run the frontend build (the frontend production build runs inside the image and can be heavy).

Basic usage
-----------
From repository root:

```bash
REGISTRY=registry.example.com \
NAMESPACE=myteam \
PROJECT=atonixcorp \
TAG=$(git rev-parse --short HEAD) \
./scripts/nerdctl-build-push.sh
```

- `REGISTRY` (required): registry host (eg. `ghcr.io`, `registry.example.com`, or `docker.io` with `registry-namespace` adjusted)
- `NAMESPACE` (optional): team or org name (default `atonix`)
- `PROJECT` (optional): project prefix (default `atonixcorp`)
- `TAG` (optional): image tag to use; if omitted the script uses short Git SHA or `local`.

CI integration example (GitHub Actions)
--------------------------------------
A minimal idea for a job that builds with nerdctl:

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install containerd + nerdctl
        run: |
          # install containerd and nerdctl according to your distro or use a prepared action
          sudo apt-get update && sudo apt-get install -y containerd
          # install nerdctl (example using release tarball)
          curl -fsSL https://github.com/containerd/nerdctl/releases/download/v1.3.0/nerdctl-full-1.3.0-amd64.tar.gz | sudo tar -xz -C /usr/local

      - name: Login to registry
        run: echo "$REGISTRY_TOKEN" | nerdctl login --username "$REGISTRY_USER" --password-stdin $REGISTRY
        env:
          REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}
          REGISTRY_USER: ${{ secrets.REGISTRY_USER }}
          REGISTRY: ghcr.io

      - name: Build and push
        env:
          REGISTRY: ghcr.io
          NAMESPACE: myorg
          PROJECT: atonixcorp
          TAG: ${{ github.sha }}
        run: ./scripts/nerdctl-build-push.sh
```

Notes & options
---------------
- Multi-arch: nerdctl supports buildx-like options. Extend the script and add `--platform` flags if you need cross-platform images.
- Image naming: script uses `REGISTRY/NAMESPACE/PROJECT-service:TAG` pattern. Adjust if your registry has different naming rules.
- If your frontend build fails during image build, fix TypeScript/frontend errors first (CI will fail for broken code).

Post-build deploy
-----------------
- Update your `docker-compose.yml` or Kubernetes manifests to reference the newly pushed image tags.
- For `docker-compose`, you can template the image names using environment variables before `docker compose up`.

Security
--------
- CI should use secrets to store registry credentials; do not hardcode credentials in repository.
- Use immutable tags (git SHA) rather than `latest` for reproducible deployments.

Support
-------
If you want, I can:
- Add a Makefile target that calls this script.
- Add a GitHub Actions job/workflow file to the repo that runs this script in CI.
- Modify `docker-compose.yml` to support image variables so you can deploy built images directly.

