OUTPUT-DIR = output
IMAGE-DIR = images


.PHONY: serve serve-stop build


build:
	./decodes build $(OUTPUT-DIR) --templates="../decod.es-templates"

serve:
	http-server $(OUTPUT-DIR) -p 8080 &
	http-server $(IMAGE-DIR) -p 8081 &
	livereload $(OUTPUT-DIR) &

serve-stop:
	kill -9 $$(ps aux | grep -v grep | grep "livereload" | awk '{print $$2}') 
	kill -9 $$(ps aux | grep -v grep | grep "http-server" | awk '{print $$2}') 

clean-files:
	rm -rf $(OUTPUT-DIR)

clean: serve-stop clean-files

delete-firebase:
	curl -X DELETE 'https://incandescent-torch-1447.firebaseio.com/content.json'
	curl -X DELETE 'https://incandescent-torch-1447.firebaseio.com/schema.json'
	curl -X DELETE 'https://incandescent-torch-1447.firebaseio.com/names.json'
