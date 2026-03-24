import { SourceDefinition } from "@/types";

export const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    slug: "wall-street-journal",
    name: "Wall Street Journal",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.wsj.com/news/technology",
    feedCandidates: ["https://feeds.a.dj.com/rss/RSSWSJD.xml"],
    entrypoints: [{ url: "https://www.wsj.com/news/technology", label: "Tech section" }]
  },
  {
    slug: "bloomberg",
    name: "Bloomberg",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.bloomberg.com/technology",
    feedCandidates: ["https://feeds.bloomberg.com/technology/news.rss"],
    entrypoints: [{ url: "https://www.bloomberg.com/technology", label: "Technology" }]
  },
  {
    slug: "reuters",
    name: "Reuters",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://reutersagency.com/technology-ai/",
    entrypoints: [
      { url: "https://reutersagency.com/technology-ai/", label: "Technology & AI" },
      {
        url: "https://reutersagency.com/content/coverage-expertise/technology/",
        label: "Coverage Expertise"
      }
    ]
  },
  {
    slug: "financial-times",
    name: "Financial Times",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.ft.com/technology",
    feedCandidates: ["https://www.ft.com/technology?format=rss"],
    entrypoints: [{ url: "https://www.ft.com/technology", label: "Technology" }]
  },
  {
    slug: "new-york-times",
    name: "New York Times",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.nytimes.com/section/technology",
    feedCandidates: ["https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"],
    entrypoints: [{ url: "https://www.nytimes.com/section/technology", label: "Technology" }]
  },
  {
    slug: "washington-post",
    name: "Washington Post",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.washingtonpost.com/business/technology/",
    feedCandidates: ["https://feeds.washingtonpost.com/rss/business/technology"],
    entrypoints: [{ url: "https://www.washingtonpost.com/business/technology/", label: "Technology" }]
  },
  {
    slug: "axios",
    name: "Axios",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.axios.com/technology",
    feedCandidates: ["https://api.axios.com/feed/technology/"],
    entrypoints: [{ url: "https://www.axios.com/technology", label: "Technology" }]
  },
  {
    slug: "cnbc",
    name: "CNBC",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://www.cnbc.com/technology/",
    feedCandidates: ["https://www.cnbc.com/id/19854910/device/rss/rss.html"],
    entrypoints: [{ url: "https://www.cnbc.com/technology/", label: "Technology" }]
  },
  {
    slug: "yahoo-japan-it",
    name: "Yahoo News Japan IT",
    kind: "media",
    category: "news_media",
    homepageUrl: "https://news.yahoo.co.jp/categories/it",
    feedCandidates: ["https://news.yahoo.co.jp/rss/categories/it.xml"],
    entrypoints: [{ url: "https://news.yahoo.co.jp/categories/it", label: "IT" }]
  },
  {
    slug: "openai",
    name: "OpenAI",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://openai.com/news/",
    feedCandidates: ["https://openai.com/news/rss.xml"],
    entrypoints: [
      { url: "https://openai.com/news/", label: "News" },
      { url: "https://openai.com/blog", label: "Blog" }
    ]
  },
  {
    slug: "google",
    name: "Alphabet / Google",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://blog.google/",
    entrypoints: [
      { url: "https://blog.google/", label: "Blog" },
      { url: "https://abc.xyz/investor/", label: "Investor Relations" }
    ]
  },
  {
    slug: "meta",
    name: "Meta",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://about.fb.com/news/",
    entrypoints: [
      { url: "https://about.fb.com/news/", label: "Newsroom" },
      { url: "https://engineering.fb.com/", label: "Engineering" }
    ]
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://www.anthropic.com/news",
    entrypoints: [
      { url: "https://www.anthropic.com/news", label: "News" },
      { url: "https://www.anthropic.com/research", label: "Research" }
    ]
  },
  {
    slug: "apple",
    name: "Apple",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://www.apple.com/newsroom/",
    entrypoints: [
      { url: "https://www.apple.com/newsroom/", label: "Newsroom" },
      { url: "https://developer.apple.com/news/", label: "Developer News" }
    ]
  },
  {
    slug: "amazon",
    name: "Amazon",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://www.aboutamazon.com/news",
    entrypoints: [
      { url: "https://www.aboutamazon.com/news", label: "News" },
      { url: "https://aws.amazon.com/blogs/", label: "AWS Blogs" }
    ]
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://news.microsoft.com/",
    entrypoints: [
      { url: "https://news.microsoft.com/", label: "News" },
      { url: "https://blogs.microsoft.com/", label: "Blogs" },
      { url: "https://devblogs.microsoft.com/", label: "Dev Blogs" }
    ]
  },
  {
    slug: "netflix",
    name: "Netflix",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://about.netflix.com/en/newsroom",
    entrypoints: [
      { url: "https://about.netflix.com/en/newsroom", label: "Newsroom" },
      { url: "https://netflixtechblog.com/", label: "Tech Blog" }
    ]
  },
  {
    slug: "uber",
    name: "Uber",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://www.uber.com/newsroom/",
    entrypoints: [
      { url: "https://www.uber.com/newsroom/", label: "Newsroom" },
      { url: "https://www.uber.com/blog/engineering/", label: "Engineering" }
    ]
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    kind: "company",
    category: "tech_company",
    homepageUrl: "https://news.airbnb.com/",
    entrypoints: [
      { url: "https://news.airbnb.com/", label: "News" },
      { url: "https://airbnb.tech/", label: "Engineering" }
    ]
  },
  {
    slug: "nvidia",
    name: "NVIDIA",
    kind: "company",
    category: "semiconductor",
    homepageUrl: "https://nvidianews.nvidia.com/",
    entrypoints: [
      { url: "https://nvidianews.nvidia.com/", label: "Newsroom" },
      { url: "https://blogs.nvidia.com/", label: "Blogs" },
      { url: "https://investor.nvidia.com/", label: "Investor Relations" }
    ]
  },
  {
    slug: "amd",
    name: "AMD",
    kind: "company",
    category: "semiconductor",
    homepageUrl: "https://www.amd.com/en/newsroom",
    entrypoints: [
      { url: "https://www.amd.com/en/newsroom", label: "Newsroom" },
      { url: "https://community.amd.com/", label: "Community" },
      { url: "https://ir.amd.com/", label: "Investor Relations" }
    ]
  },
  {
    slug: "intel",
    name: "Intel",
    kind: "company",
    category: "semiconductor",
    homepageUrl: "https://www.intel.com/content/www/us/en/newsroom/home.html",
    entrypoints: [
      {
        url: "https://www.intel.com/content/www/us/en/newsroom/home.html",
        label: "Newsroom"
      },
      {
        url: "https://www.intel.com/content/www/us/en/developer/overview.html",
        label: "Developer"
      }
    ]
  }
];
