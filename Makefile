.PHONY: install compile serve

install:
	npm install

compile:
	browserify src/wallet.js --standalone wallet -o dist/wallet.js
	browserify src/bn.js --standalone bn -o dist/bn.js

serve:
	npx http-server

run: compile serve

