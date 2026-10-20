# Ansible Automation for Hospital Management System

This directory contains Ansible playbooks to automatically configure host servers, install Docker and dependencies, and deploy the Hospital System.

## Files

- **`inventory.ini`**: Lists target servers (localhost or remote server IPs).
- **`ansible.cfg`**: Ansible configuration file.
- **`playbook.yml`**: Full automation playbook to install Docker, clone repo, and run `docker compose up -d --build`.
- **`deploy-k8s.yml`**: Playbook to deploy the Kubernetes manifests via `kubectl`.

## How to Run

### 1. Test connection to target servers
```bash
ansible -i inventory.ini hospital_servers -m ping
```

### 2. Run the Docker server setup and deployment playbook
```bash
ansible-playbook -i inventory.ini playbook.yml
```

### 3. Deploy to Kubernetes via Ansible (if Kubernetes is installed on target host)
```bash
ansible-playbook -i inventory.ini deploy-k8s.yml
```
