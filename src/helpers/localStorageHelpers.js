import { 
    LS_ACCESS_TOKEN, LS_AUTH_USER, 
    LS_REFRESH_TOKEN, LS_CODE_EDITOR,
    LS_GEN_USER_CSV_LOG,
} from "constants/localStorageKeys";

export function __ls_set_access_token(token) {
    localStorage.setItem(LS_ACCESS_TOKEN, token);
}
export function __ls_get_access_token() {
    return localStorage.getItem(LS_ACCESS_TOKEN);
}

export function __ls_set_refresh_token(token) {
    localStorage.setItem(LS_REFRESH_TOKEN, token);
}
export function __ls_get_refresh_token() {
    return localStorage.getItem(LS_REFRESH_TOKEN);
}

export function __ls_set_auth_user(data) {
    localStorage.setItem(LS_AUTH_USER, JSON.stringify(data))
}
export function __ls_get_auth_user() {
    return JSON.parse(localStorage.getItem(LS_AUTH_USER))
}

export function __ls_remove_credentials() {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
    localStorage.removeItem(LS_AUTH_USER);
}

export function __ls_get_code_editor() {
    const val = localStorage.getItem(LS_CODE_EDITOR)
    if (val) return JSON.parse(val);
    return "";
}
export function __ls_set_code_editor(code) {
    localStorage.setItem(LS_CODE_EDITOR, code)
}
export function __ls_remove_code_editor() {
    localStorage.removeItem(LS_CODE_EDITOR)
}

export function __ls_get_user_csv_log() {
    return localStorage.getItem(LS_GEN_USER_CSV_LOG) || []
}
export function __ls_set_user_csv_log(arr) {
    localStorage.setItem(LS_GEN_USER_CSV_LOG, arr || [])
}