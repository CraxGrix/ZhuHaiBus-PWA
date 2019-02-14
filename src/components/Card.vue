<template>
			<v-flex xs12  class="card" @click="viewConversion(router[0]['Id'])">
				<v-card>
					<v-layout align-center justify-center fill-height>
						<v-flex xs9>
							<v-card-title>
					<div>	
            			<div class="title">{{ router[0].Name }}</div>
            			<span class="body-2">{{ router[0].FromStation }}</span>
            			<span class="body-1">  驶往  </span>
            			<span class="body-2">{{ router[0].ToStation }}</span>
            		</div>
					</v-card-title>
						</v-flex>
						<v-flex xs3>
								<v-btn icon @click.stop="reverseRouter(router[0]['Id'])">
							<v-icon>swap_horiz</v-icon>
						</v-btn>
						</v-flex>
					</v-layout>
				</v-card>
			</v-flex>	
</template>
<script>
import { mapActions, mapMutations } from 'vuex'
export default {
	props: ["router"],
	data: () => ({
	}),
	methods: {
		...mapActions(["viewConversion"]),
		...mapMutations(["reverseRouter"])
	}
}
</script>
<style scoped>
.card {
	margin-top: 2.1vh
}
</style>