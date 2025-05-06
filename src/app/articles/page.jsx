"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await api.get("/articles");
        setArticles(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Artikel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{article.title}</h2>
            <p>{article.category?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
