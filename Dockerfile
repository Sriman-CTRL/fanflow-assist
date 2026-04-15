FROM nginx:alpine

# Copy static assets into nginx
COPY . /usr/share/nginx/html

# Expose $PORT required by Cloud Run
ENV PORT=8080
EXPOSE $PORT

# Start nginx and update the listening port to $PORT (Cloud Run default)
CMD sed -i -e 's/listen       80;/listen       '"$PORT"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
