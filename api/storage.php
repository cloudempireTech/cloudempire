<?php
declare(strict_types=1);
require __DIR__.'/content-store.php';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET')!=='GET') respond(405,['error'=>'Method not allowed.']);
verify_owner();
$db=content_database();
$media=(int)$db->query('SELECT COUNT(*) FROM ce_media')->fetchColumn();
$bytes=(int)$db->query('SELECT COALESCE(SUM(bytes),0) FROM ce_media')->fetchColumn();
$views=(int)$db->query('SELECT COUNT(*) FROM ce_views')->fetchColumn();
$inquiries=(int)$db->query('SELECT COUNT(*) FROM ce_inquiries')->fetchColumn();
$recent=$db->query('SELECT id,name,mime,bytes,created_at FROM ce_media ORDER BY created_at DESC LIMIT 24')->fetchAll();
$q=$db->query('SELECT revision,OCTET_LENGTH(content_json) AS content_bytes,updated_at FROM ce_site_content WHERE id=1')->fetch();
respond(200,['database'=>DB_NAME,'contentRevision'=>(int)$q['revision'],'contentBytes'=>(int)$q['content_bytes'],'contentUpdatedAt'=>$q['updated_at'],'mediaCount'=>$media,'mediaBytes'=>$bytes,'viewsTotal'=>$views,'inquiriesTotal'=>$inquiries,'recentMedia'=>$recent]);
