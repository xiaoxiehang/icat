<?php
$isDebug   = preg_match('/debug/i', $_SERVER['QUERY_STRING']);
$isLocal   = preg_match('/localhost|dev\.|\d+(\.\d+){3}/i', $_SERVER['HTTP_HOST']);
$isLocalIP = preg_match('/\d+(\.\d+){3}/', $_SERVER['HTTP_HOST']);
$ucweb     = preg_match('/UC/i', $_SERVER['HTTP_USER_AGENT']);
$ip        = GetHostByName($_SERVER['SERVER_NAME']);

$source    = $isDebug? '.source' : '';
$ucClass   = $ucweb? 'uc-hack' : '';
$root = $isLocalIP? 'http://'.$ip.':8899' : '..';
$webroot   = $isLocal? $root : 'http://assets.3gtest.gionee.com';

$sysRef    = '..';
$appRef    = 'styles';
$appPic    = $appRef.'/pic';
$timestamp = '?t=20120521';
?>