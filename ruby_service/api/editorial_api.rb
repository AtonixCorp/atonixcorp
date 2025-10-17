# Editorial API Endpoints
# frozen_string_literal: true

require 'grape'
require 'grape-entity'

class EditorialAPI < Grape::API
  format :json
  prefix :editorial

  # Article Entity
  class ArticleEntity < Grape::Entity
    expose :id
    expose :title
    expose :content
    expose :status
    expose :author
    expose :published_at
    expose :tags
    expose :seo_metadata
  end

  # Feed Entity
  class FeedEntity < Grape::Entity
    expose :id
    expose :name
    expose :url
    expose :last_updated
    expose :item_count
    expose :status
  end

  namespace :articles do
    desc 'Get all articles'
    params do
      optional :status, type: String, values: %w[draft published archived]
      optional :author, type: String
      optional :tags, type: Array[String]
      optional :page, type: Integer, default: 1
      optional :per_page, type: Integer, default: 20
    end
    get do
      # Fetch articles from database with filters
      articles = fetch_articles(params)

      present articles, with: ArticleEntity
    end

    desc 'Get article by ID'
    params do
      requires :id, type: Integer
    end
    get ':id' do
      article = fetch_article(params[:id])

      error!('Article not found', 404) unless article

      present article, with: ArticleEntity
    end

    desc 'Create new article'
    params do
      requires :title, type: String
      requires :content, type: String
      optional :author, type: String
      optional :tags, type: Array[String]
      optional :seo_metadata, type: Hash
    end
    post do
      article = create_article(params)

      # Trigger background processing
      EditorialWorker.perform_async('process_article', article[:id])

      present article, with: ArticleEntity
    end

    desc 'Update article'
    params do
      requires :id, type: Integer
      optional :title, type: String
      optional :content, type: String
      optional :status, type: String, values: %w[draft published archived]
      optional :tags, type: Array[String]
      optional :seo_metadata, type: Hash
    end
    put ':id' do
      article = update_article(params[:id], params.except(:id))

      # Re-trigger background processing if content changed
      if params.key?(:content) || params.key?(:title)
        EditorialWorker.perform_async('process_article', article[:id])
      end

      present article, with: ArticleEntity
    end

    desc 'Delete article'
    params do
      requires :id, type: Integer
    end
    delete ':id' do
      delete_article(params[:id])

      { message: 'Article deleted successfully' }
    end

    desc 'Trigger article indexing'
    post 'index' do
      EditorialWorker.perform_async('index_articles')

      { message: 'Article indexing triggered', status: 'queued' }
    end
  end

  namespace :feeds do
    desc 'Get all feeds'
    params do
      optional :status, type: String, values: %w[active inactive]
      optional :page, type: Integer, default: 1
      optional :per_page, type: Integer, default: 20
    end
    get do
      feeds = fetch_feeds(params)

      present feeds, with: FeedEntity
    end

    desc 'Get feed by ID'
    params do
      requires :id, type: Integer
    end
    get ':id' do
      feed = fetch_feed(params[:id])

      error!('Feed not found', 404) unless feed

      present feed, with: FeedEntity
    end

    desc 'Create new feed'
    params do
      requires :name, type: String
      requires :url, type: String
      optional :description, type: String
      optional :update_interval, type: Integer, default: 900 # 15 minutes
    end
    post do
      feed = create_feed(params)

      present feed, with: FeedEntity
    end

    desc 'Update feed'
    params do
      requires :id, type: Integer
      optional :name, type: String
      optional :url, type: String
      optional :description, type: String
      optional :status, type: String, values: %w[active inactive]
      optional :update_interval, type: Integer
    end
    put ':id' do
      feed = update_feed(params[:id], params.except(:id))

      present feed, with: FeedEntity
    end

    desc 'Delete feed'
    params do
      requires :id, type: Integer
    end
    delete ':id' do
      delete_feed(params[:id])

      { message: 'Feed deleted successfully' }
    end

    desc 'Trigger feed updates'
    post 'update' do
      EditorialWorker.perform_async('update_feeds')

      { message: 'Feed updates triggered', status: 'queued' }
    end
  end

  namespace :seo do
    desc 'Generate sitemap'
    post 'sitemap' do
      EditorialWorker.perform_async('generate_sitemap')

      { message: 'Sitemap generation triggered', status: 'queued' }
    end

    desc 'Trigger SEO optimization'
    post 'optimize' do
      EditorialWorker.perform_async('optimize_seo')

      { message: 'SEO optimization triggered', status: 'queued' }
    end

    desc 'Get SEO statistics'
    get 'stats' do
      # Return SEO statistics
      fetch_seo_stats
    end
  end

  namespace :maintenance do
    desc 'Trigger content cleanup'
    post 'cleanup' do
      EditorialWorker.perform_async('cleanup_content')

      { message: 'Content cleanup triggered', status: 'queued' }
    end
  end

  # Helper methods (implement these based on your data storage)
  helpers do
    def fetch_articles(params)
      # Implementation to fetch articles from database
      []
    end

    def fetch_article(id)
      # Implementation to fetch single article
      nil
    end

    def create_article(params)
      # Implementation to create article
      {}
    end

    def update_article(id, params)
      # Implementation to update article
      {}
    end

    def delete_article(id)
      # Implementation to delete article
    end

    def fetch_feeds(params)
      # Implementation to fetch feeds
      []
    end

    def fetch_feed(id)
      # Implementation to fetch single feed
      nil
    end

    def create_feed(params)
      # Implementation to create feed
      {}
    end

    def update_feed(id, params)
      # Implementation to update feed
      {}
    end

    def delete_feed(id)
      # Implementation to delete feed
    end

    def fetch_seo_stats
      # Implementation to fetch SEO statistics
      {}
    end
  end
end