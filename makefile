OUTPUT-DIR = output


.PHONY: serve serve-stop build


build:
	./decodes build $(OUTPUT-DIR)

serve:
	http-server $(OUTPUT-DIR) &
	livereload $(OUTPUT-DIR) &

serve-stop:
	kill -9 $$(ps aux | grep -v grep | grep "livereload" | awk '{print $$2}') 
	kill -9 $$(ps aux | grep -v grep | grep "http-server" | awk '{print $$2}') 

clean-files:
	rm -rf $(OUTPUT-DIR)

clean: serve-stop clean-files
