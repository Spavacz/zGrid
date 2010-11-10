<?php

// sort helpers
function sortme_desc($a, $b) {
	if ($a->sort == $b->sort) {
        return 0;
    }
    return ($a->sort < $b->sort) ? -1 : 1;
}
function sortme_asc($a, $b) {
	if ($a->sort == $b->sort) {
        return 0;
    }
    return ($a->sort > $b->sort) ? -1 : 1;
}

// default values
$page = !empty($_GET['page']) ? $_GET['page'] : 1;
$limit = !empty($_GET['limit']) ? $_GET['limit'] : 10;
$sort = !empty($_GET['sort']) ? $_GET['sort'] : 'id';
$order = !empty($_GET['order']) ? $_GET['order'] : 'desc';

// load sample data
$data = json_decode(file_get_contents('example.json'));

// sort data
foreach( $data as $k => $v) {
	$data[$k]->sort = $v->$sort;
}
usort( $data, 'sortme_' . $order );

// limit data
$data = array_chunk($data, $limit);
$data = $data[$page-1];

// build response and add controls
$out = array('success' => true, 'data' => array());
foreach( $data as $k => $v ) {
	unset($v->sort);
	$out['data'][$k]['cols'] = $v;
	$out['data'][$k]['ctrl'] = array(
		'edit' => array(
			'url'	=> '#edit', 
			'label'	=> 'Edit', 
			'img'	=> 'images/edit.png',
			'css'	=> 'edit-btn'),
		'delete' => array(
			'url'	=> '#delete',
			'label'	=> 'Delete',
			'img'	=> 'images/delete.png',
			'css'	=> 'delete-btn')
	);
}
echo json_encode($out);