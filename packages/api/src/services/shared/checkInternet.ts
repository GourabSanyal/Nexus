export const checkInternet = () => {
    if (!navigator.onLine){
        return false
    }

    return true
}
