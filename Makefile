.PHONY: dev api web db seed build

export PATH := /opt/homebrew/opt/node@20/bin:/opt/homebrew/opt/postgresql@16/bin:$(PATH)

dev:
	npm run dev

api:
	cd services/api-gateway && npm run dev

web:
	cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:4000 npm run dev

db:
	psql postgresql://quickbite:quickbite@localhost:5432/quickbite -f services/api-gateway/sql/init.sql

seed:
	cd services/api-gateway && DATABASE_URL=postgres://quickbite:quickbite@localhost:5432/quickbite npm run seed

build:
	npm run build

