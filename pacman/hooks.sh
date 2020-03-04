
pre_install() {
	useradd -U -l -M -r -s /usr/bin/nologin -d /var/lib/symatem-infrastructure -G http -c "infrastructure taxometry with Symatem" symatem-infrastructure
}

post_install() {
	systemctl daemon-reload
	systemctl enable symatem-infrastructure
	systemctl enable symatem-infrastructure.socket
	systemctl start symatem-infrastructure.socket
}

pre_upgrade() {
	systemctl stop symatem-infrastructure.socket
	systemctl stop symatem-infrastructure
}

post_upgrade() {
	systemctl daemon-reload
	systemctl start symatem-infrastructure.socket
}

pre_remove() {
	systemctl stop symatem-infrastructure.socket
	systemctl disable symatem-infrastructure.socket
	systemctl stop symatem-infrastructure
	systemctl disable symatem-infrastructure
}

post_remove() {
	systemctl daemon-reload
	userdel symatem-infrastructure
	groupdel symatem-infrastructure
}
