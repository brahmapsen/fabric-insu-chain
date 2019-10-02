docker rm -f $(docker ps -aq)
docker network prune
docker rmi dev-peer0*
