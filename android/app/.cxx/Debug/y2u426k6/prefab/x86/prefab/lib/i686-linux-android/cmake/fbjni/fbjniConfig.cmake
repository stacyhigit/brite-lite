if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "C:/Users/Stacy/.gradle/caches/transforms-3/20e14a3a1faed9ce3da9af0343545221/transformed/jetified-fbjni-0.5.1/prefab/modules/fbjni/libs/android.x86/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Stacy/.gradle/caches/transforms-3/20e14a3a1faed9ce3da9af0343545221/transformed/jetified-fbjni-0.5.1/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

