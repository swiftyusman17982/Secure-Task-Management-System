
import { Injectable, signal } from '@angular/core';

@Injectable({
        providedIn: 'root'
})
export class ThemeService {
        isDarkMode = signal(true);

        toggleTheme() {
                this.isDarkMode.set(!this.isDarkMode());
                if (this.isDarkMode()) {
                        document.documentElement.classList.remove('light-theme');
                } else {
                        document.documentElement.classList.add('light-theme');
                }
        }
}
