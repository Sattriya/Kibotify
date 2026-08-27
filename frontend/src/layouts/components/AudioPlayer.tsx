import { usePlayerStore } from "../../stores/usePlayerStore"
import { useEffect, useRef } from "react"

const AudioPlayer = () => {
	// ref untuk mengakses element audio secara langsung
	const audioRef = useRef<HTMLAudioElement>(null);

	// menyimpan URL lagu sebelumnya untuk mengecek apakah lagu berubah
	const prevSongRef = useRef<string | null>(null);

	// mengambil data lagu dan function player dari player store
	const { currentSong, isPlaying, playNext } = usePlayerStore();

	// menjalankan atau menghentikan audio berdasarkan status isPlaying
	useEffect(() => {
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying]);

	// menjalankan lagu berikutnya ketika audio selesai diputar
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		// menghapus event listener ketika component di-unmount
		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// mengganti source audio ketika currentSong berubah
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// mengecek apakah lagu yang sedang diputar berbeda dengan lagu sebelumnya
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;

		if (isSongChange) {
			// mengganti source audio dengan lagu yang baru
			audio.src = currentSong?.audioUrl;

			// mengembalikan posisi audio ke awal
			audio.currentTime = 0;

			// menyimpan URL lagu saat ini untuk pengecekan berikutnya
			prevSongRef.current = currentSong?.audioUrl;

			// langsung memutar lagu jika player sedang dalam kondisi playing
			if (isPlaying) audio.play();
		}
	}, [currentSong, isPlaying]);

	return <audio ref={audioRef} />;
};

export default AudioPlayer;