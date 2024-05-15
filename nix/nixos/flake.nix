{
  description = "My nixOS flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    hyprland.url = "git+https://github.com/hyprwm/Hyprland?submodules=1";

  };

  outputs = { self, nixpkgs, hyprland, ...} @ inputs: 
  let 
    system = "x86_64-linux";

    pkgs = import nixpkgs {
      inherit system;

      config = {
        allowUnfree = true;
      };
    };
  
  in
  {

    nixosConfigurations = {
      nixos = nixpkgs.lib.nixosSystem {
        specialArgs = { 
          inherit system; 
          inherit inputs;  
        };

        modules = [
          ./configuration.nix
        ];
      };
    };
  };
}
