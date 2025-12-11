# docker build -t my-jekyll-site .
docker run --rm -p 4000:4000 -v $(pwd):/site my-jekyll-site
