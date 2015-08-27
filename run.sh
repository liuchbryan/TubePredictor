while :
do
	cp api_logger/log.txt.bak api_logger/log.txt
	nodejs server.js
	sleep 2
done
