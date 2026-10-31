ALTER TABLE document_ratings ADD CONSTRAINT rating_value_range CHECK (value BETWEEN 1 AND 5);
ALTER TABLE documents ADD CONSTRAINT nonnegative_views CHECK (views_count >= 0);
ALTER TABLE documents ADD CONSTRAINT cover_requires_alt CHECK (cover_image_url IS NULL OR length(trim(cover_image_alt)) > 0);
ALTER TABLE reports ADD CONSTRAINT exactly_one_report_target CHECK ((document_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int = 1);
CREATE UNIQUE INDEX unique_open_document_report ON reports (reporter_id, document_id) WHERE status = 'OPEN' AND document_id IS NOT NULL;
CREATE UNIQUE INDEX unique_open_comment_report ON reports (reporter_id, comment_id) WHERE status = 'OPEN' AND comment_id IS NOT NULL;
ALTER TABLE search_click_logs ADD CONSTRAINT log_event_shape CHECK (
  (event_type = 'SEARCH' AND clicked_doc_id IS NULL AND search_id IS NULL AND result_count IS NOT NULL)
  OR (event_type = 'CLICK' AND clicked_doc_id IS NOT NULL AND search_id IS NOT NULL)
);
ALTER TABLE search_click_logs ADD CONSTRAINT log_pagination CHECK (page >= 1 AND (position IS NULL OR position >= 1));
