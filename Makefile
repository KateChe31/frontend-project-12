install:
	npm install
	npm install --prefix frontend

build:
	npm run build --prefix frontend

start:
	npm run server

lint:
	npm run lint --prefix frontend

lint-fix:
	npm run lint:fix --prefix frontend
