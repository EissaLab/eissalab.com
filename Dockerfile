FROM ruby:3.1-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /site

COPY Gemfile ./
RUN bundle install --jobs 4 --retry 3

EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", \
     "--host", "0.0.0.0", \
     "--baseurl", "", \
     "--watch", \
     "--force_polling", \
     "--livereload", \
     "--livereload-ignore", "_site"]
