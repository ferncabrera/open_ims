#!/bin/bash
echo "************** Your containers **************"
docker container ls -a 
echo "************** Your images **************" 
docker image ls -a
echo "************** Pruning containers **************"
docker container prune -f
echo "************** Pruning all images not being used **************"
docker image prune -a -f