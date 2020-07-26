import Component from '@glimmer/component';

export default class CircularProgress extends Component {
  get path() {
    const π = Math.PI;
    const α = this.args.value * 360;
    const r = (α * π) / 180;
    const mid = α > 180 ? 1 : 0;
    const x = Math.sin(r) * 38;
    const y = Math.cos(r) * -38;

    return `M 0 0 v -38 A 38 38 1 ${mid} 1 ${x} ${y} z`;
  }
}
