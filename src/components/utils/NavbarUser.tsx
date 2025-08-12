export function NavbarUser(){
    return (
        <div className="navbar-user">
            <ul className="flex space-x-4 justify-center text-black p-4 border-2 border-black bg-white m-2 rounded-2xl">
                <li><a href="/jualbeli">Jual Beli</a></li>
                <li><a href="/informasi">Informasi</a></li>
                <li><a href="/info-kupva">Kupva Di Sekitar Anda</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </div>
    );
}