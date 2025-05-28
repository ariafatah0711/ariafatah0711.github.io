FROM ruby:3.2

# Install dependencies
RUN apt-get update -qq && apt-get install -y build-essential libvips

# Set workdir
WORKDIR /site

# Copy Gemfile & Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install

# Copy the rest of your site
COPY . .

# Expose port 4000
EXPOSE 4000

# Default command
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]