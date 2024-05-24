use rand::Rng;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn roll_dice(sides: u32, amount: u32) -> Vec<u32> {
    let mut rng = rand::thread_rng();
    (0..amount).map(|_| rng.gen_range(1..sides + 1)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roll_d6() {
        for _ in 1..100 {
            let result = roll_dice(6, 3);
            assert_eq!(result.len(), 3);
            for num in result.iter() {
                assert!(1 <= *num && *num <= 6);
            }
        }
    }
    #[test]
    fn test_roll_d12() {
        for _ in 1..100 {
            let result = roll_dice(12, 3);
            assert_eq!(result.len(), 3);
            for num in result.iter() {
                assert!(1 <= *num && *num <= 12);
            }
        }
    }
    #[test]
    fn test_roll_d20() {
        for _ in 1..100 {
            let result = roll_dice(20, 3);
            assert_eq!(result.len(), 3);
            for num in result.iter() {
                assert!(1 <= *num && *num <= 20);
            }
        }
    }
}
