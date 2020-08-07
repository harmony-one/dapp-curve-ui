.PHONY: install compile serve

install:
	npm install

compile:
	browserify src/wallet.js --standalone wallet -o dist/wallet.js

serve:
	python3 -m http.server 8080

run: compile serve

