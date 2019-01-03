<?php

/**
 * Implementation of hook_user_default_roles().
 */
function roles_feature_user_default_roles() {
  $roles = array();

  // Exported role: Editor
  $roles['Editor'] = array(
    'name' => 'Editor',
  );

  return $roles;
}
