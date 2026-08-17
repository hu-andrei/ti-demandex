SHELL := /bin/sh

PORT ?= 8010
HOST ?= 127.0.0.1
PYTHON ?= python3
PID_FILE := .server.pid

.PHONY: help start stop restart clean

help:
	@echo "Comandos disponíveis:"
	@echo "  make start    Inicia o servidor local em http://$(HOST):$(PORT)/html/"
	@echo "  make stop     Para o servidor local"
	@echo "  make restart  Reinicia o servidor local"
	@echo "  make help     Exibe esta ajuda"
	@echo "  make clean    Remove arquivos temporários"

start:
	@if [ -f "$(PID_FILE)" ] && kill -0 "$$(cat "$(PID_FILE)")" 2>/dev/null; then \
		echo "O servidor já está em execução (PID $$(cat "$(PID_FILE)")), em http://$(HOST):$(PORT)/html/"; \
	else \
		$(PYTHON) -m http.server $(PORT) --bind $(HOST) > .server.log 2>&1 & \
		echo $$! > "$(PID_FILE)"; \
		echo "Servidor iniciado em http://$(HOST):$(PORT)/html/"; \
	fi

stop:
	@if [ -f "$(PID_FILE)" ]; then \
		PID=$$(cat "$(PID_FILE)"); \
		if kill -0 "$$PID" 2>/dev/null; then kill "$$PID" && echo "Servidor parado (PID $$PID)."; \
		else echo "O servidor não está em execução."; fi; \
		rm -f "$(PID_FILE)"; \
	else \
		echo "O servidor não está em execução."; \
	fi

restart: stop start

clean:
	@echo "Removendo arquivos temporários..."
	@rm -f "$(PID_FILE)" .server.log
	@echo "Arquivos temporários removidos."