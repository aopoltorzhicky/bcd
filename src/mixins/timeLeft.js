const timeLeft = {
    data() {
        return {
            timeout: 5000,
            timeLeft_Seconds: 0,
            timeLeftInterval: null,
        }
    },
    methods: {
        setTimeLeft() {
            this.timeLeftInterval = setInterval(() => {
                this.timeLeft_Seconds -= 1;
                if (!this.timeLeft_Seconds) {
                    clearInterval(this.timeLeftInterval);
                }
            }, 1000);
        },
        removeTimeLeft() {
            clearInterval(this.timeLeftInterval);
        }
    },
    created() {
        this.timeLeft_Seconds = this.timeout / 1000;
        this.setTimeLeft();
    },
    destroyed() {
        this.removeTimeLeft();
    },
};

export default timeLeft;