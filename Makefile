.PHONY: install compile serve

install:
	npm install

compile:
	browserify src/wallet.js --standalone wallet -o dist/wallet.js
	browserify src/bn.js --standalone bn -o dist/bn.js
	browserify src/erc20.js --standalone bn -o dist/erc20.js

serve:
	npx http-server

run: compile serve

