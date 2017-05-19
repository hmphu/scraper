all: update

build:
	arara ${TARGET}
	
update:
	git difftex ${TARGET}.tex > diff.tex
	# set diff.tex to orig file if nothing changed.
	[ -s diff.tex ] || cp ${TARGET}.tex diff.tex
	xelatex -synctex=on -interaction=nonstopmode -halt-on-error diff.tex
	rm -f diff.{aux,bcf,log,out,run.xml}
	killall -HUP mupdf

clean:
	rm -f diff.{tex,pdf}

watch:
	# idk why inotifywait exits with error code & no message,
	# but here's the workaround, just run the damn thing anyway,
	# success or not.
	while true; do \
		until inotifywait -qre close_write ./${TARGET}.tex; do sleep .5; make; done;\
	done
