FROM ruby:3.2
WORKDIR /app
RUN gem install sinatra
COPY app.rb /app/app.rb
EXPOSE 4567
CMD ["ruby", "app.rb"]
