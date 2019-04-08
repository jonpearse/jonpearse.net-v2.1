SELECT session_id, url, content_type, content_id
FROM stats_pageviews
GROUP BY CONCAT(session_id, url)
ORDER BY session_id
