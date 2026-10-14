<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
verify_admin($_SERVER['REQUEST_METHOD'] !== 'GET');

function github_content(string $method, ?array $body=null): array {
    $settings=private_settings('github');
    $token=(string)($settings['token'] ?? '');
    if ($token==='') respond(503,['error'=>'GitHub publishing token is missing.']);
    $url='https://api.github.com/repos/cloudempireTech/cloudempire/contents/src/content.json';
    if ($method==='GET') $url.='?ref=main';
    $request=curl_init($url);
    $options=[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>20,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>[
        'Accept: application/vnd.github+json','Authorization: Bearer '.$token,'User-Agent: CloudEmpire-Admin','X-GitHub-Api-Version: 2022-11-28','Content-Type: application/json',
    ]];
    if ($body!==null) $options[CURLOPT_POSTFIELDS]=json_encode($body,JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);
    curl_setopt_array($request,$options);
    $response=curl_exec($request); $status=curl_getinfo($request,CURLINFO_HTTP_CODE); curl_close($request);
    $result=is_string($response) ? json_decode($response,true) : null;
    if ($status<200 || $status>=300 || !is_array($result)) {
        error_log('CloudEmpire GitHub content request failed: HTTP '.$status);
        respond($status===409 ? 409 : 502,['error'=>$status===409 ? 'Content changed elsewhere. Refresh the admin page.' : 'Publishing failed. Check the GitHub token in Database & storage.']);
    }
    return $result;
}

if ($_SERVER['REQUEST_METHOD']==='GET') {
    $file=github_content('GET');
    $source=base64_decode((string)($file['content'] ?? ''),true);
    $content=$source===false ? null : json_decode($source,true);
    if (!is_array($content)) respond(502,['error'=>'Published content could not be read.']);
    respond(200,['sha'=>$file['sha'],'content'=>$content]);
}
if ($_SERVER['REQUEST_METHOD']!=='PUT') respond(405,['error'=>'Method not allowed.']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>600000) respond(413,['error'=>'Content is too large.']);
$input=json_decode(file_get_contents('php://input') ?: '',true);
$content=$input['content'] ?? null;
$sha=$input['sha'] ?? null;
$message=$input['message'] ?? null;
if (!is_array($content) || !is_string($sha) || !preg_match('/^[a-f0-9]{40}$/',$sha) || !is_string($message)) respond(400,['error'=>'Invalid content update.']);
foreach (['articles','services','projects','processSteps'] as $key) if (!isset($content[$key]) || !is_array($content[$key]) || array_values($content[$key])!==$content[$key]) respond(400,['error'=>'Content structure is invalid.']);
$source=json_encode($content,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_INVALID_UTF8_SUBSTITUTE);
if (!is_string($source) || strlen($source)>500000) respond(413,['error'=>'Content is too large.']);
$result=github_content('PUT',['message'=>substr($message,0,120),'content'=>base64_encode($source."\n"),'sha'=>$sha,'branch'=>'main']);
respond(200,['sha'=>$result['content']['sha'] ?? '']);
