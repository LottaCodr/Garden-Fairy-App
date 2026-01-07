import { Button } from "../custom/Button";
import SearchIcon from "@mui/icons-material/Search";

export function Hero() {
    return (
        <section
            className="relative min-h-[320px] md:min-h-[400px] lg:min-h-[460px] bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEqkXZ-5CD-H-6ixzT8piHm1-xAxeMJoCkiIFWOlDSmkp3URwZ6dwVNSVBVZKBGnwg9BMfyPi5b3YbEnZN7_F_KhWwrhElqbPEV442UZMkQJPIE0BQHoSVUzv8CZhdRX39Zk1E2udu6gtExKDk2Whmw_25LQGWaMs_4Jm-ZEuKL6Xdl_ekMW4BvjLAFNOVVWULrXkB00dIQvcpYbPXkJ5QXvSW3ahPcm4jPox4oZu1ezzK3U4wADbn_dszLib0bMyKMHu2fM1rBPk'')" }}
        >
            <div className="absolute inset-0 bg-black/40 z-0" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center w-full px-4 pt-10 pb-10">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg mb-4">
                    Fresh Plants Delivered Nationwide.
                </h1>
                <form
                    className="w-full max-w-md flex items-center gap-2 mt-2"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="flex bg-white/90 rounded-lg items-center w-full px-3 py-2 shadow">
                        <SearchIcon className="w-5 h-5 text-gray-400 mr-2" fontSize="small" />
                        <input
                            type="text"
                            placeholder="Search indoor, outdoor or any plant…"
                            className="bg-transparent focus:outline-none text-gray-800 w-full"
                        />
                    </div>
                    <Button type="submit" className="ml-2 px-5 py-2">
                        Search
                    </Button>
                </form>
                <div className="flex gap-4 mt-6">
                    <Button variant="primary" className="shadow">
                        Shop Now
                    </Button>
                    <Button variant="ghost" className="text-white border-white border shadow">
                        Explore Collections
                    </Button>
                </div>
            </div>
        </section>
    );
}